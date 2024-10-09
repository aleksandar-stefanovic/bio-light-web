import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import Invoice from '../data/Invoice.ts';
import InvoiceDao from '../data/supabase/InvoiceDao.ts';
import LineItemDao from '../data/supabase/LineItemDao.ts';
import * as PaymentDao from '../data/supabase/PaymentDao.ts';
import * as CustomerDao from '../data/supabase/CustomerDao.ts';
import Payment from '../data/Payment.ts';
import Customer, {CustomerId} from '../data/Customer.ts';
import Product from '../data/Product.ts';
import ProductDao from '../data/supabase/ProductDao.ts';
import Price from '../data/Price.ts';
import {upsertPrices} from '../data/supabase/PriceDao.ts';
import LineItem from '../data/LineItem.ts';

interface RepositoryProps {
    invoices: Invoice[];
    insertInvoice: (invoice: Invoice, lineItems: LineItem[]) => Promise<Invoice>;
    updateInvoice: (invoice: Invoice, lineItems: LineItem[], previousCustomerId?: CustomerId) => Promise<void>;
    payments: Payment[];
    recalculateBalance: (customerId: CustomerId) => Promise<void>;
    nextInvoiceRefNo: string;
    customers: Customer[];
    products: Product[];
    insertPayment: (payment: Payment) => Promise<void>;
    updatePayment: (payment: Payment, previousCustomerId?: CustomerId) => Promise<void>;
    insertCustomer: (customer: Customer, prices: Price[]) => Promise<void>;
    updateCustomer: (customer: Customer, prices: Price[]) => Promise<void>;
    updatePrices: (prices: Price[]) => Promise<void>;
}

const RepositoryContext = createContext<RepositoryProps>({
    invoices: [],
    insertInvoice: async() => { throw Error() },
    payments: [],
    recalculateBalance: async() => { throw Error() },
    nextInvoiceRefNo: '',
    products: [],
    customers: [],
    insertPayment: () => { throw Error(); },
    updatePayment: () => { throw Error(); },
    insertCustomer: () => { throw Error(); },
    updateCustomer: () => { throw Error(); },
    updateInvoice: () => { throw Error(); },
    updatePrices : () => { throw Error(); }
});

// eslint-disable-next-line react-refresh/only-export-components
export const useRepository = () => useContext(RepositoryContext);

/**
 *
 * Currently, fetches whole relations of data (no pagination). This should be done smarter at some point, but for now
 * is working sufficiently well, as tables aren't that big.
 */
export function RepositoryProvider({children}: {children: ReactNode}) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    const fetchInvoices = useCallback(async() => {
        try {
            const invoices = await InvoiceDao.getAll();
            setInvoices(invoices);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchPayments = useCallback(async() => {
        try {
            const payments = await PaymentDao.getAll();
            setPayments(payments);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchCustomers = useCallback(async() => {
        try {
            const customers = await CustomerDao.getAll();
            setCustomers(customers);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchProducts = useCallback(async() => {
        try {
            const products = await ProductDao.getAll();
            setProducts(products);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const nextInvoiceRefNo: string = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const currentYearSuffix = currentYear % 100;

        const latestInvoice = invoices[0];
        if (!latestInvoice) {
            return `1/${currentYearSuffix}`
        }

        const invoiceYear = latestInvoice.date.getFullYear();

        // Edge case that happens at the beginning of the year
        if (invoiceYear !== currentYear) {
            return `1/${currentYearSuffix}`;
        }

        const invoiceRefNo = Number(latestInvoice.ref_no.split('/')[0]);

        return `${invoiceRefNo + 1}/${currentYearSuffix}`;
    }, [invoices]);

    const recalculateBalance = useCallback(async(customerId: CustomerId) => {
        const transactions = await CustomerDao.getAllTransactions(customerId);

        let balance = 0;

        // Await in for-loop, but that's okay, as there won't be many records updated on average
        for (const transaction of transactions) {
            if ('date_due' in transaction) {
                balance += transaction.amount;
                if (transaction.balance != balance) {
                    await InvoiceDao.updateOne({id: transaction.id, balance: balance});
                }
            } else {
                balance -= transaction.amount;
                if (transaction.balance != balance) {
                    await PaymentDao.updateOne({id: transaction.id, balance: balance});
                }
            }
        }

        await CustomerDao.updateOne({id: customerId, balance});

        setCustomers(customers => {
            return customers.map(customer => {
                if (customer.id === customerId) {
                    return {...customer, balance};
                } else {
                    return customer;
                }
            });
        });

        // This is very inefficient, improve at some point
        await fetchInvoices();
        await fetchPayments();
    }, [fetchInvoices, fetchPayments]);

    const insertInvoice = useCallback(async(invoice: Invoice, lineItems: LineItem[]) => {
        const storedInvoice = await InvoiceDao.insertOne(invoice);
        lineItems.forEach(lineItem => {
            lineItem.invoice_id = storedInvoice.id;
        });
        await LineItemDao.insert(lineItems);

        await recalculateBalance(invoice.customer_id);

        return storedInvoice;
    }, [recalculateBalance]);

    const updateInvoice = useCallback(async(invoice: Invoice, lineItems: LineItem[], previousCustomerId?: CustomerId) => {
        await InvoiceDao.updateOne(invoice);
        await LineItemDao.insert(lineItems);

        await recalculateBalance(invoice.customer_id);
        if (previousCustomerId) {
            await recalculateBalance(previousCustomerId);
        }

    }, [recalculateBalance]);

    const insertPayment = useCallback(async(payment: Payment) => {
        await PaymentDao.insertOne(payment);
        const newPayments = [payment, ...payments];
        setPayments(newPayments);
        await recalculateBalance(payment.customer_id);
    }, [payments, recalculateBalance]);

    const updatePayment = useCallback(async(payment: Payment, previousCustomerId?: CustomerId) => {
        await PaymentDao.updateOne(payment);
        await recalculateBalance(payment.customer_id);

        // Editing the payment allows for changing the customer, so the previous customer should be tracked to correctly update the balance
        if (previousCustomerId && previousCustomerId !== payment.customer_id) {
            await recalculateBalance(previousCustomerId);
        }
    }, [recalculateBalance]);

    const insertCustomer = useCallback(async(customer: Customer, prices: Price[]) => {
        const insertedCustomer = await CustomerDao.insertOne(customer);
        prices.forEach(price => {
            price.customer_id = insertedCustomer.id;
        });

        await upsertPrices(prices);

        setCustomers(customers => [...customers, insertedCustomer]);
    }, []);

    const updateCustomer = useCallback(async(customer: Customer, prices: Price[]) => {
        await CustomerDao.updateOne(customer);
        await upsertPrices(prices);

        setCustomers(customers => {
            return customers.map(prevCustomer => {
                return prevCustomer.id === customer.id ? customer : prevCustomer;
            });
        });
    }, []);

    const updatePrices = useCallback(async(prices: Price[])=> {
        await upsertPrices(prices);
    }, []);


    useEffect(() => {
        // Ideally, this would somehow be paginated and cached locally, however, this is fine for now
        void fetchInvoices();
        void fetchPayments();
        void fetchCustomers();
        void fetchProducts();
    }, [fetchCustomers, fetchInvoices, fetchPayments, fetchProducts]);

    return <RepositoryContext.Provider value={{
        invoices,
        payments,
        insertInvoice,
        updateInvoice,
        recalculateBalance,
        nextInvoiceRefNo,
        customers,
        products,
        insertPayment,
        updatePayment,
        insertCustomer,
        updateCustomer,
        updatePrices
    }}>
        {children}
    </RepositoryContext.Provider>
}

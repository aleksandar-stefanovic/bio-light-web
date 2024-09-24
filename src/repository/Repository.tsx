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

interface RepositoryProps {
    invoices: Invoice[];
    insertInvoice: (invoice: Invoice) => Promise<Invoice>;
    payments: Payment[];
    recalculateBalance: (customerId: CustomerId) => Promise<void>;
    nextInvoiceRefNo: string;
    customers: Customer[];
    products: Product[];
}

const RepositoryContext = createContext<RepositoryProps>({
    invoices: [],
    insertInvoice: async() => { throw Error() },
    payments: [],
    recalculateBalance: async() => { throw Error() },
    nextInvoiceRefNo: '',
    products: [],
    customers: []
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

        // Form a timeline of all the transactions. In case both payment and an invoice happened in the same day,
        // a payment should be ordered first (so that, ideally, balance returns to zero), and then the following
        // invoice can be taken into account.
        const transactions = [
            ...invoices,
            ...payments
        ]
        .filter(transaction => transaction.customer_id === customerId)
        .sort((a, b) => {
            if (a.date < b.date) {
                return -1;
            } else if (a.date > b.date) {
                return 1;
            } else if ('za_uplatu' in a) {
                return -1;
            } else {
                return 1;
            }
        });

        let balance = 0;
        const transactionsToUpdate: {id: number, balance: number, type: 'invoice'|'payment'}[] = [];

        transactions.forEach(transaction => {
            if ('date_due' in transaction) {
                balance += transaction.amount;
                if (transaction.balance != balance) {
                    transaction.balance = balance;
                    transactionsToUpdate.push({id: transaction.id, balance: balance, type: 'invoice'});
                }
            } else {
                balance -= transaction.amount;
                if (transaction.balance != balance) {
                    transaction.balance = balance;
                    transactionsToUpdate.push({id: transaction.id, balance: balance, type: 'payment'});
                }
            }
        });

        console.log(`Transactions changed: ${transactionsToUpdate.length}`);

        // TODO

    }, [invoices, payments]);

    const insertInvoice = useCallback(async(invoice: Invoice) => {
        const storedInvoice = await InvoiceDao.insert(invoice);
        const lineItems = invoice.lineItems;
        lineItems.forEach(lineItem => {
            lineItem.invoice_no = storedInvoice.id;
        });
        await LineItemDao.insert(lineItems);

        setInvoices(prevState => [storedInvoice, ...prevState]);

        await recalculateBalance(invoice.customer_id);

        return storedInvoice;
    }, [recalculateBalance]);

    useEffect(() => {
        // Ideally, this would somehow be paginated and cached locally, however, this is fine for now
        void fetchInvoices();
        void fetchPayments();
        void fetchCustomers();
        void fetchProducts();
    }, [fetchInvoices, fetchPayments]);

    return <RepositoryContext.Provider value={{invoices, payments, insertInvoice, recalculateBalance, nextInvoiceRefNo, customers, products}}>
        {children}
    </RepositoryContext.Provider>
}

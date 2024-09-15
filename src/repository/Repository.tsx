import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import Invoice from '../data/Invoice.ts';
import InvoiceDao from '../data/supabase/RacunDao.ts';

interface RepositoryProps {
    invoices: Invoice[];
    insertInvoice: (invoice: Invoice) => Promise<Invoice>;
}

const RepositoryContext = createContext<RepositoryProps>({
    invoices: [],
    insertInvoice: async() => { throw Error() }
});

export const useRepository = () => useContext(RepositoryContext);

export function RepositoryProvider({children}: {children: ReactNode}) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    const fetchInvoices = useCallback(async() => {
        try {
            const invoices = await InvoiceDao.getAll();
            setInvoices(invoices);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const insertInvoice = useCallback(async(invoice: Invoice) => {
        const storedInvoice = InvoiceDao.insert(invoice);
        // TODO update balances for Invoices and Payments
        // TODO store ST Proizovds
        return storedInvoice;
    }, []);

    useEffect(() => {
        void fetchInvoices();
    }, [fetchInvoices]);

    return <RepositoryContext.Provider value={{invoices, insertInvoice}}>
        {children}
    </RepositoryContext.Provider>


}

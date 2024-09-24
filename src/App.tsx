import React, {useCallback, useEffect, useMemo, useState} from 'react';
import './App.css';
import {
    Alert,
    Button,
    createTheme,
    CssBaseline,
    Snackbar,
    Tab,
    Tabs,
    ThemeProvider,
    useMediaQuery
} from '@mui/material';
import TabCreateInvoice from './tab/TabCreateInvoice.tsx';
import {useGlobalState} from './GlobalStateProvider';
import LoginPage from './LoginPage';
import TabCustomers from './tab/TabCustomers.tsx';
import TabInvoices from './tab/TabInvoices.tsx';
import Invoice from './data/Invoice.ts';
import InvoiceDocument from './document/InvoiceDocument.tsx';
import Customer from './data/Customer.ts';
import * as CustomerDao from './data/supabase/CustomerDao.ts';
import {signOut as so} from './user/Auth';
import supabase from './supabase/client';
import {User} from '@supabase/supabase-js';
import Product from './data/Product.ts';
import ProductDao from './data/supabase/ProductDao.ts';
import TabPayments from './tab/TabPayments.tsx';
import {RepositoryProvider, useRepository} from './repository/Repository.tsx';

function App() {
    const [tabIndex, setTabIndex] = useState(0);
    const [globalState] = useGlobalState();
    const [snackbarState, setSnackbarState] = useState<{
        open: boolean;
        type: 'success' | 'info' | 'warning' | 'error',
        message: string
    }>({open: false, type: 'info', message: ''});

    const [user, setUser] = useState<User | null>();

    const [customers, setCustomers] = useState<Customer[]>([]);

    const {nextInvoiceRefNo} = useRepository();

    React.useEffect(() => {
        // TODO move to Repository
        CustomerDao.getAll().then(customers => {
            setCustomers(customers);
        });
    }, [setCustomers]);

    useEffect(() => {
        if (user === undefined) {
            supabase.auth.getSession().then(({data: {session}}) => {
                setUser(session?.user ?? null);
            });

            const {
                data: {subscription},
            } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
            });

            return () => subscription.unsubscribe();
        }

    }, [user, setUser]);

    const insertInvoice = useCallback(async (invoice: Invoice) => {
        // TODO use Repository
    }, []);

    const updateInvoice = useCallback(async(invoice: Invoice) => {
        // TODO use Repository
    }, []);

    const [proizvods, setProizvods] = React.useState<Product[]>([]);

    React.useEffect(() => {
        (async () => {
            setProizvods(await ProductDao.getAll());
        })();
    }, [setProizvods]);


    const showSnackbar = useCallback((type: 'success' | 'warning' | 'info' | 'error' = 'info', message: string) => {
        setSnackbarState({
            open: true,
            type,
            message
        });
    }, [setSnackbarState]);

    const handleSnackbarClose = useCallback(() => {
        setSnackbarState(oldState => ({...oldState, open: false}));
    }, [setSnackbarState]);

    const signOut = useCallback(async () => {
        await so();
        setUser(null);
    }, [setUser]);

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const theme = useMemo(() => createTheme({
        palette: {
            mode: prefersDarkMode ? 'dark' : 'light',
        },
    }), [prefersDarkMode]);

    return user ? <>
            <RepositoryProvider>
                <div className="screen-only"
                     style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column'}}>

                    <ThemeProvider theme={theme}>
                        <CssBaseline/>
                        <div style={{borderBottom: 1, borderColor: 'divider', display: 'flex', flexDirection: 'row'}}>
                            <Tabs value={tabIndex} onChange={(_, index) => setTabIndex(index)}
                                  aria-label="basic tabs example">
                                <Tab label="Izrada računa"/>
                                <Tab label="Kupci"/>
                                <Tab label="Računi"/>
                                <Tab label="Uplate"/>
                            </Tabs>
                            <div style={{flex: 1}}></div>
                            <Button onClick={signOut}>Odjavi&nbsp;se</Button>
                        </div>
                        <TabCreateInvoice visible={tabIndex === 0}
                                          style={{flex: 1}}
                                          showSnackbar={showSnackbar}
                                          onInvoiceSave={insertInvoice}
                                          nextInvoiceNo={nextInvoiceRefNo}
                                          kupacs={customers}
                                          theme={theme}
                                          proizvods={proizvods}/>
                        <TabCustomers
                            visible={tabIndex === 1}
                            style={{flex: 1}}
                            showSnackbar={showSnackbar}
                            kupacs={customers}
                            proizvods={proizvods}
                            theme={theme}
                        />
                        <TabInvoices
                            visible={tabIndex === 2}
                            style={{flex: 1}}
                            kupacs={customers}
                            showSnackbar={showSnackbar}
                            theme={theme}
                            onInvoiceUpdate={updateInvoice}
                            proizvods={proizvods}/>
                        <TabPayments visible={tabIndex === 3}
                                     kupacs={customers}
                                     style={{flex: 1}}
                                     showSnackbar={showSnackbar}
                                     theme={theme}
                        />
                        <Snackbar
                            open={snackbarState?.open}
                            autoHideDuration={5000}
                            onClose={handleSnackbarClose}
                            anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
                            <Alert severity={snackbarState?.type}>{snackbarState?.message}</Alert>
                        </Snackbar>

                    </ThemeProvider>
                </div>
                <div className="">
                    {globalState.invoiceToPrint && <InvoiceDocument data={globalState.invoiceToPrint}/>}
                </div>
            </RepositoryProvider>
        </>
        :
        <LoginPage user={user} onSetUser={setUser}/>;
}

export default App;

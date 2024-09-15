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
import TabIzrada from './tab/TabIzrada';
import {useGlobalState} from './GlobalStateProvider';
import LoginPage from './LoginPage';
import TabKupci from './tab/TabKupci';
import TabInvoices from './tab/TabInvoices.tsx';
import Invoice from './data/Invoice.ts';
import InvoiceDao from './data/supabase/RacunDao';
import InvoiceDocument from "./document/InvoiceDocument.tsx";
import Kupac from './data/Kupac';
import * as KupacDao from './data/supabase/KupacDao';
import {signOut as so} from './user/Auth';
import supabase from './supabase/client';
import {User} from '@supabase/supabase-js';
import Proizvod from './data/Proizvod';
import ProizvodDao from './data/supabase/ProizvodDao';
import TabUplate from './tab/TabUplate.tsx';
import {RepositoryProvider} from './repository/Repository.tsx';

function App() {
    const [tabIndex, setTabIndex] = useState(0);
    const [globalState] = useGlobalState();
    const [snackbarState, setSnackbarState] = useState<{
        open: boolean;
        type: 'success' | 'info' | 'warning' | 'error',
        message: string
    }>({open: false, type: 'info', message: ''});

    const [user, setUser] = useState<User | null>();

    const [kupacs, setKupacs] = useState<Kupac[]>([]);
    const [nextInvoiceNo, setNextInvoiceNo] = useState<string>('');

    const refetch = useCallback(async () => {
        const [kupacs, nextInvoiceNo] = await Promise.all([KupacDao.getAll(), InvoiceDao.getNextInvoiceNo()]);
        setKupacs(kupacs);
        setNextInvoiceNo(nextInvoiceNo);
    }, [setKupacs, setNextInvoiceNo]);

    React.useEffect(() => {
        void refetch();
    }, [refetch]);

    React.useEffect(() => {
        const channel = supabase
        .channel('schema-db-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
            },
            async () => {
                await refetch()
            }
        )
        .subscribe()

        return () => {
            void channel.unsubscribe();
        }

    }, [refetch]);

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
        await InvoiceDao.insert(invoice);
        await refetch();
    }, [refetch]);

    const updateInvoice = useCallback(async(invoice: Invoice) => {
        await InvoiceDao.update(invoice);
        await refetch();
    }, [refetch]);

    const [proizvods, setProizvods] = React.useState<Proizvod[]>([]);

    React.useEffect(() => {
        (async () => {
            setProizvods(await ProizvodDao.getAll());
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
                        <TabIzrada visible={tabIndex === 0}
                                   style={{flex: 1}}
                                   showSnackbar={showSnackbar}
                                   onInvoiceSave={insertInvoice}
                                   nextInvoiceNo={nextInvoiceNo}
                                   kupacs={kupacs}
                                   theme={theme}
                                   proizvods={proizvods}/>
                        <TabKupci
                            visible={tabIndex === 1}
                            style={{flex: 1}}
                            showSnackbar={showSnackbar}
                            kupacs={kupacs}
                            proizvods={proizvods}
                            theme={theme}
                        />
                        <TabInvoices
                            visible={tabIndex === 2}
                            style={{flex: 1}}
                            kupacs={kupacs}
                            showSnackbar={showSnackbar}
                            theme={theme}
                            onInvoiceUpdate={updateInvoice}
                            proizvods={proizvods}/>
                        <TabUplate visible={tabIndex === 3}
                                   kupacs={kupacs}
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

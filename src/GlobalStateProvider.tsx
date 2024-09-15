import React, {Dispatch, useContext} from 'react';
import Invoice from "./data/Invoice.ts";
import Kupac from "./data/Kupac";
import Proizvod from "./data/Proizvod";

interface GlobalStateProps {
    invoiceToPrint?: {invoice: Invoice, kupac: Kupac, proizvods: Proizvod[]},
    proizvods?: Proizvod[]
}

const globalStateContext = React.createContext<GlobalStateProps>({});
const dispatchStateContext = React.createContext<Dispatch<GlobalStateProps>>(() => {
    console.log('this shouldn\'t occur')
});

export const GlobalStateProvider = ({children}: { children: JSX.Element }) => {
    const [state, dispatch] = React.useReducer(
        (state: GlobalStateProps, newValue: GlobalStateProps) => {
            return ({...state, ...newValue});
        }, {});
    return (
        <globalStateContext.Provider value={state}>
            <dispatchStateContext.Provider value={dispatch}>
                {children}
            </dispatchStateContext.Provider>
        </globalStateContext.Provider>
    );
};

export function useGlobalState(): [GlobalStateProps, React.Dispatch<GlobalStateProps>] {
    return [useContext(globalStateContext), useContext(dispatchStateContext)];
}

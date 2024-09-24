import React, {Dispatch, useContext} from 'react';
import Invoice from "./data/Invoice.ts";
import Customer from "./data/Customer.ts";
import Product from "./data/Product.ts";

interface GlobalStateProps {
    invoiceToPrint?: {invoice: Invoice, customer: Customer, products: Product[]},
    products?: Product[]
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

// eslint-disable-next-line react-refresh/only-export-components
export function useGlobalState(): [GlobalStateProps, React.Dispatch<GlobalStateProps>] {
    return [useContext(globalStateContext), useContext(dispatchStateContext)];
}

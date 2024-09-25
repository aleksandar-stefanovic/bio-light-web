import Invoice from "../data/Invoice.ts";
import Customer from "../data/Customer.ts";
import './RacunDocument.css';
import logo from '../logo.png';
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";

interface InvoiceDocumentProps {
    data: {invoice: Invoice, customer: Customer}
}

export default function InvoiceDocument({data: {invoice, customer}}: InvoiceDocumentProps) {

    const format = new Intl.DateTimeFormat('sr-RS', {year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC'})
    const invoiceNumber = `${invoice.ref_no}/${invoice.date.getFullYear() % 100}`

    return <ScopedCssBaseline>
        <div style={{margin: '5% 7%', fontSize: '0.8em'}}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div style={{display: 'flex', height: 170}}>
                    <img src={logo} alt="logo" style={{maxHeight: '100%', width: 'auto'}}/>
                    <div style={{lineHeight: 0.5, marginLeft: 10}}>
                        <p style={{fontFamily: 'serif', fontWeight: 'bold', fontSize: '1.2em'}}>SZR „BIO-LIGHT“</p>
                        <p>Adresa: Kapetana Koče 61/1, Jagodina</p>
                        <p>Telefon: mob. 062/324-966</p>
                        <p>E-mail: biolightszr@gmail.com</p>
                        <p>Matični broj: 61302719</p>
                        <p>Šifra delatnosti: 15822</p>
                        <p>PIB: 106484740</p>
                        <p>Tekući račun: 200-2563350201017-80</p>
                    </div>
                </div>

                <div style={{lineHeight: 0.5}}>
                    <p style={{
                        fontFamily: 'serif',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        textAlign: 'end'
                    }}>{customer.name}</p>
                    <p style={{textAlign: 'end'}}>Adresa: {customer.address}</p>
                    <p style={{textAlign: 'end'}}>PIB: {customer.tin}</p>
                    <p style={{textAlign: 'end'}}>MBR: {customer.id_no}</p>
                    <p style={{textAlign: 'end'}}>Račun: {customer.account_no}</p>
                </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                    <p style={{fontWeight: 'bold', marginLeft: '5%'}}>Otpremljeno na adresu:</p>
                    <p style={{border: '1px solid #aaaaaa', padding: '5%', width: 'max-content'}}>
                        <span style={{fontWeight: 'bold'}}>{customer.delivery_name}</span>
                        <br/>
                        <span>{customer.delivery_street}</span>

                        {customer.delivery_city && <><br/><span>{customer.delivery_city}</span></>}
                    </p>
                </div>
                <div>
                    <p style={{fontWeight: 'bold', marginLeft: '5%'}}>Mesto otpremanja:</p>
                    <p style={{
                        border: '1px solid #aaaaaa',
                        padding: 10,
                        textAlign: 'right',
                        boxSizing: 'border-box',
                        whiteSpace: 'nowrap'
                    }}>
                        <span style={{fontWeight: 'bold'}}>SZR „BIO-LIGHT“</span>
                        <br/>
                        Kapetana Koče 61/1, 35000 Jagodina
                    </p>
                </div>
            </div>
            <h2 style={{textAlign: 'center', marginTop: '2%'}}>RAČUN-OTPREMNICA br. {invoiceNumber}</h2>

            <table className='main-table'>
                <tbody>
                <tr>
                    <th>EAN kod</th>
                    <th>Naziv proizvoda</th>
                    <th>Količina</th>
                    <th>JM</th>
                    <th>Cena</th>
                    <th>Rabat</th>
                    <th>Osnovica</th>
                    <th>Vrednost</th>
                </tr>
                {invoice.lineItems?.map((lineItem, index) => {
                    return <tr key={index}>
                        <td>{lineItem.ean}</td>
                        <td>{lineItem.name}</td>
                        <td>{lineItem.count}</td>
                        <td>{lineItem.bulk ? 'kg' : 'kom'}</td>
                        <td>{lineItem.price.toFixed(2)}</td>
                        <td>{lineItem.discount_perc}%</td>
                        <td>{lineItem.amount.toFixed(2)}</td>
                        <td>{lineItem.amount_before_discount.toFixed(2)}</td>
                    </tr>;
                })}
                </tbody>
            </table>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '2%'}}>
                <table>
                    <tbody>
                    <tr>
                        <td>Datum prometa:</td>
                        <td>{format.format(invoice.date)}</td>
                    </tr>
                    <tr>
                        <td>Datum računa:</td>
                        <td>{format.format(invoice.date)}</td>
                    </tr>
                    <tr>
                        <td>Datum valute:</td>
                        <td>{format.format(invoice.date_due)}</td>
                    </tr>
                    <tr>
                        <td>Mesto prometa:</td>
                        <td>Jagodina</td>
                    </tr>
                    </tbody>
                </table>
                <div>
                    <table className="cell-padding-1" style={{border: '1px solid black'}}>
                        <tbody>
                        <tr>
                            <td style={{width: 150}}>Prodajna vrednost:</td>
                            <td style={{textAlign: 'end'}}>{invoice.amount_before_discount.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Odobreni rabat:</td>
                            <td style={{textAlign: 'end'}}>{invoice.discount.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Ukupna vrednost:</td>
                            <td style={{textAlign: 'end'}}>{invoice.amount.toFixed(2)}</td>
                        </tr>
                        <tr style={{border: '1px solid black'}}>
                            <td>Ukupno:</td>
                            <td style={{textAlign: 'end'}}>{invoice.amount.toFixed(2)}</td>
                        </tr>
                        </tbody>
                    </table>
                    <p style={{width: '100%'}}>Slovima: {serbianString(invoice.amount)}</p>
                </div>
            </div>
            <p style={{marginTop: '5%'}}>Uplatu izvršiti sa pozivom na broj: <span
                style={{fontWeight: 'bold'}}>97 {invoiceNumber}</span></p>

            <table style={{marginTop: '4%'}}>
                <tbody>
                <tr>
                    <td style={{verticalAlign: 'top', width: 90}}>Napomena:</td>
                    <td>SZR „BIO-LIGHT“ nije obveznik PDV-a.<br/>PDV nije obračunat.</td>
                </tr>
                </tbody>
            </table>

            <p style={{marginTop: '2%'}}>
                U slučaju neblagovremenog plaćanja, obračunava se zakonska zatezna kamata.<br/>
                Za sve eventualne sporove nadležan je Privredni sud u Kragujevcu.
            </p>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '4%', fontSize: '1.2em'}}>
                <div style={{width: 280}}>
                    <div style={{display: "flex", width: '100%'}}>
                        <p style={{margin: 0}}>Robu otpremio:</p>
                        <div style={{flex: 1, borderBottom: '1px solid black'}}></div>
                    </div>
                    <br/>
                    <div style={{display: "flex", width: '100%'}}>
                        <p style={{margin: 0}}>Vozač:</p>
                        <div style={{flex: 1, borderBottom: '1px solid black'}}></div>
                    </div>
                </div>
                <div style={{width: 330}}>
                    <div style={{display: "flex", width: '100%'}}>
                        <p style={{margin: 0}}>Robu primio:</p>
                        <div style={{flex: 1, borderBottom: '1px solid black'}}></div>
                    </div>
                    <br/>
                    <div style={{display: "flex", width: '100%'}}>
                        <p style={{margin: 0}}>Br. l.k.:</p>
                        <div style={{flex: 1, borderBottom: '1px solid black'}}></div>
                        <p style={{margin: 0}}>SUP:</p>
                        <div style={{flex: 1, borderBottom: '1px solid black'}}></div>
                    </div>
                </div>
            </div>

            <div style={{display: "flex", width: 280, marginTop: '5%', fontSize: '1.2em'}}>
                <p style={{margin: 0}}>Ovlašćeno lice:</p>
                <div style={{flex: 1, borderBottom: '1px solid black'}}></div>
            </div>

            <p style={{width: '100%', textAlign: 'center', fontSize: '1.2em'}}>M.P.</p>
        </div>
    </ScopedCssBaseline>
}

function serbianString(iznos: number): string {
    let string = "";

    const beforeDot: number = Math.floor(iznos);
    const afterDot = (iznos - beforeDot);

    if (beforeDot / 1000 !== 0) {
        const broj = beforeDot / 1000;

        switch (broj) {
            case 1:
                string += "jednahiljada";
                break;
            case 2:
                string += "dvehiljade";
                break;
            case 3:
                string += "trihiljade";
                break;
            case 4:
                string += "četirihiljade";
                break;
            case 5:
                string += "pethiljada";
                break;
            case 6:
                string += "šesthiljada";
                break;
            case 7:
                string += "sedamhiljada";
                break;
            case 8:
                string += "osamhiljada";
                break;
            case 9:
                string += "devethiljada";
                break;
            case 10:
                string += "desethiljada";
                break;
            case 11:
                string += "jedanaesthiljada";
                break;
            case 12:
                string += "dvanaesthiljada";
                break;
            case 13:
                string += "trinaesthiljada";
                break;
            case 14:
                string += "četrnaesthiljada";
                break;
            case 15:
                string += "petnaesthiljada";
                break;
            case 16:
                string += "šestnaesthiljada";
                break;
            case 17:
                string += "sedamnaesthiljada";
                break;
            case 18:
                string += "osamnaesthiljada";
                break;
            case 19:
                string += "devetnaesthiljada";
                break;
        }

        if (broj > 19) {
            switch (Math.floor(broj / 10)) {
                case 2:
                    string += "dvadeset";
                    break;
                case 3:
                    string += "trideset";
                    break;
                case 4:
                    string += "četrdeset";
                    break;
                case 5:
                    string += "pedeset";
                    break;
                case 6:
                    string += "šezdeset";
                    break;
                case 7:
                    string += "sedamdeset";
                    break;
                case 8:
                    string += "osamdeset";
                    break;
                case 9:
                    string += "devedeset";
                    break;
            }

            switch (broj % 10) {
                case 0:
                    string += "hiljada";
                    break;
                case 1:
                    string += "jednahiljada";
                    break;
                case 2:
                    string += "dvehiljade";
                    break;
                case 3:
                    string += "trihiljade";
                    break;
                case 4:
                    string += "četirihiljade";
                    break;
                case 5:
                    string += "pethiljada";
                    break;
                case 6:
                    string += "šesthiljada";
                    break;
                case 7:
                    string += "sedamhiljada";
                    break;
                case 8:
                    string += "osamhiljada";
                    break;
                case 9:
                    string += "devethiljada";
                    break;
            }
        }


    }

    const smallNumber = beforeDot % 1000;

    switch (Math.floor(smallNumber / 100)) {
        case 1:
            string += "sto";
            break;
        case 2:
            string += "dvesta";
            break;
        case 3:
            string += "trista";
            break;
        case 4:
            string += "četiristo";
            break;
        case 5:
            string += "petsto";
            break;
        case 6:
            string += "šesto";
            break;
        case 7:
            string += "sedamsto";
            break;
        case 8:
            string += "osamsto";
            break;
        case 9:
            string += "devetsto";
            break;
    }

    if (Math.floor(smallNumber % 100 / 10) === 1) {
        switch (smallNumber % 100) {
            case 19:
                string += "devetnaest";
                break;
            case 18:
                string += "osamnaest";
                break;
            case 17:
                string += "sedamnaest";
                break;
            case 16:
                string += "šestnaest";
                break;
            case 15:
                string += "petnaest";
                break;
            case 14:
                string += "četrnaest";
                break;
            case 13:
                string += "trinaest";
                break;
            case 12:
                string += "dvanaest";
                break;
            case 11:
                string += "jedanaest";
                break;
            case 10:
                string += "deset";
                break;
        }
    } else {
        switch (Math.floor(smallNumber % 100 / 10)) {
            case 2:
                string += "dvadeset";
                break;
            case 3:
                string += "trideset";
                break;
            case 4:
                string += "četrdeset";
                break;
            case 5:
                string += "pedeset";
                break;
            case 6:
                string += "šezdeset";
                break;
            case 7:
                string += "sedamdeset";
                break;
            case 8:
                string += "osamdeset";
                break;
            case 9:
                string += "devedeset";
                break;
        }

        switch (smallNumber % 10) {
            case 1:
                string += "jedan";
                break;
            case 2:
                string += "dva";
                break;
            case 3:
                string += "tri";
                break;
            case 4:
                string += "četiri";
                break;
            case 5:
                string += "pet";
                break;
            case 6:
                string += "šest";
                break;
            case 7:
                string += "sedam";
                break;
            case 8:
                string += "osam";
                break;
            case 9:
                string += "devet";
                break;
            default:
                break;
        }
    }

    string += " dinara";

    if (afterDot !== 0.0) {
        string += ` i ${(afterDot * 100).toFixed(0)}/100`;
    }

    return string;
}

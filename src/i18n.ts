// noinspection SpellCheckingInspection

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

void i18n.use(initReactI18next).init({
	resources: {
		en: {
			translation: {
				cancel: 'Cancel',
				confirm: 'Confirm',
				product: 'Product',
				addProduct: 'Add product',
				amount: 'Amount',
				discountRebate: 'Discount',
				pricePiece: 'Price (piece)',
				priceBulk: 'Price (bulk)',
				priceChangeDialog: {
					title: 'Price changes',
					table: {
						name: 'Product',
						ppuPiece: 'Price (piece)',
						discountPiece: 'Discount (piece)',
						ppuBulk: 'Price (bulk)',
						discountBulk: 'Discount (bulk)'
					}
				}
			}
		},
		'sr-Latn': {
			translation: {
				cancel: 'Otkaži',
				confirm: 'Potvrdi',
				product: 'Proizvod',
				addProduct: 'Dodaj proizvod',
				amount: 'Količina',
				discountRebate: 'Rabat',
				pricePiece: 'Cena (kom)',
				priceBulk: 'Cena (kg)',
				priceChangeDialog: {
					title: 'Promena cena',
					table: {
						name: 'Naziv proizvoda',
						ppuPiece: 'Cena (komad)',
						discountPiece: 'Rabat (komad)',
						ppuBulk: 'Cena (rinfuz)',
						discountBulk: 'Rabat (rinfuz)'
					}
				}
			}
		},
	},
	lng: 'sr-Latn',  // default language
	fallbackLng: 'en',
	interpolation: {
		escapeValue: false, // React already escapes by default
	}
});
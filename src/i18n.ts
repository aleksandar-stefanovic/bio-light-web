// noinspection SpellCheckingInspection

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

void i18n.use(initReactI18next).init({
	resources: {
		en: {
			translation: {
				priceChangeDialog: {
					title: 'Price changes',
				}
			}
		},
		'sr-Latn': {
			translation: {
				cancel: 'Otkaži',
				confirm: 'Potvrdi',
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
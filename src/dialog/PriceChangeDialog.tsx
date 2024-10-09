import Price from '../data/Price.ts';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {useRepository} from '../repository/Repository.tsx';

export interface PriceChangeDialogProps {
    open: boolean;
    changes: {oldPrice: Price, newPrice: Price}[];
    onClose: (confirm: boolean) => void;
}

export default function PriceChangeDialog({open, changes, onClose}: PriceChangeDialogProps) {
    const {t} = useTranslation();
    const {products} = useRepository();

    const tableData = changes.map(({oldPrice, newPrice}) => {
        function createDiffText(oldValue: number, newValue: number) {
            return oldValue !== newValue ? {
                text: `${oldValue} → ${newValue}`,
                bold: true
            } : {
                text: oldValue.toString()
            };
        }

        return {
            name: products.find(product => product.id === oldPrice.product_id)?.short_name,
            ppuPiece: createDiffText(oldPrice.piece, newPrice.piece),
            discountPiece: createDiffText(oldPrice.discount_piece, newPrice.discount_piece),
            ppuBulk: createDiffText(oldPrice.kg, newPrice.kg),
            discountBulk: createDiffText(oldPrice.discount_kg, newPrice.discount_kg)
        };
    })

    return <Dialog open={open} maxWidth='md'>
        <DialogTitle>{t('priceChangeDialog.title')}</DialogTitle>
        <DialogContent>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align='right'>{t('priceChangeDialog.table.name')}</TableCell>
                        <TableCell>{t('priceChangeDialog.table.ppuPiece')}</TableCell>
                        <TableCell>{t('priceChangeDialog.table.discountPiece')}</TableCell>
                        <TableCell>{t('priceChangeDialog.table.ppuBulk')}</TableCell>
                        <TableCell>{t('priceChangeDialog.table.discountBulk')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tableData.map(({name, ppuPiece, discountPiece, ppuBulk, discountBulk}) => {
                        return <TableRow>
                            <TableCell width={300} align='right'>{name}</TableCell>
                            <TableCell width={200} style={{fontWeight: ppuPiece.bold ? 'bold' : undefined}}>{ppuPiece.text}</TableCell>
                            <TableCell width={200} style={{fontWeight: discountPiece.bold ? 'bold' : undefined}}>{discountPiece.text}%</TableCell>
                            <TableCell width={200} style={{fontWeight: ppuBulk.bold ? 'bold' : undefined}}>{ppuBulk.text}</TableCell>
                            <TableCell width={200} style={{fontWeight: discountBulk.bold ? 'bold' : undefined}}>{discountBulk.text}%</TableCell>
                        </TableRow>
                    })}
                </TableBody>
            </Table>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => { onClose(false); }}>{t('cancel')}</Button>
            <Button onClick={() => { onClose(true); }}>{t('confirm')}</Button>
        </DialogActions>
    </Dialog>
}
import { toImageUrl } from '../services/urls.js';

/**
 * Чистит HTML статьи перед показом и перед сохранением.
 *
 *  • Неразрывные пробелы (&nbsp; / U+00A0) → обычные.
 *    Они массово попадают в Quill при копировании текста из Word, Google Docs
 *    и с сайтов. Браузер не переносит строку на неразрывном пробеле, и абзац
 *    тянется в одну строку далеко за пределы блока.
 *  • Адреса картинок вида http://ilsatao.ru/uploads/... → /uploads/...
 *    (рабочий путь через nginx и без предупреждений mixed content на https).
 */
export function normalizeArticleHtml(html) {
    if (!html) return '';
    return html
        .replace(/(?:&nbsp;| )+/g, ' ')
        .replace(/(<img\b[^>]*?\ssrc=")([^"]+)(")/gi, (m, a, src, b) =>
            src.startsWith('data:') ? m : a + toImageUrl(src) + b);
}

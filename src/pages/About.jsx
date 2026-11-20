import { usePageMeta } from '../utils/pageMeta.js';
import AboutContent from '../components/AboutContent';

export default function About() {
    usePageMeta({
        title: 'О компании — поставки автомобилей из Китая',
        description: 'ILSATAO — поставки автомобилей из Китая для компаний, дилеров и автосалонов. Команда в Китае и России: подбор, проверка, выкуп, доставка и растаможка.',
    });
    return (
        <div className="min-h-screen">
            <AboutContent asPage />
        </div>
    );
}
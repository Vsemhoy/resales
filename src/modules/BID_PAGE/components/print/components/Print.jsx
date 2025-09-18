import {useState, useEffect} from "react";
import TitleChapter from "./chapters/TitleChapter";
import ContentsChapter from "./chapters/ContentsChapter";
import SpecificationChapter from "./chapters/SpecificationChapter";
import CharacteristicsChapter from "./chapters/CharacteristicsChapter";

const Print = ({ bidId, type, info, models, phone, email, currency, amounts }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [chaptersRendered, setChaptersRendered] = useState({
        title: { startPage: 1, rendered: false },
        contents: { startPage: 0, rendered: false },
        specification: { startPage: 0, rendered: false },
        characteristics: { startPage: 0, rendered: false },
    });

    const updateCurrentPage = (pagesUsed, chapter) => {
        setChaptersRendered(prev => {
            const newChaptersRendered = {
                ...prev,
                [chapter]: {
                    startPage: prev[chapter].startPage || currentPage,
                    rendered: true
                }
            };
            setCurrentPage(prevPage => prevPage + pagesUsed);
            return newChaptersRendered;
        });
    };

    useEffect(() => {
        console.log('Current page:', currentPage);
        console.log('Chapters rendered:', chaptersRendered);
    }, [currentPage, chaptersRendered]);

    return (
        <div className="print-container">
            <TitleChapter
                type={type}
                titleInfo={info.titleInfo}
                startPage={currentPage}
                name={'title'}
                phone={phone}
                email={email}
                onRender={(pagesUsed, chapter) => updateCurrentPage(pagesUsed, chapter)}
            />

            {chaptersRendered.title.rendered && (
                <ContentsChapter
                    startPage={chaptersRendered.title.startPage}
                    name={'contents'}
                    chapterNum={1}
                    subChapterNum={1.1}
                    chaptersRendered={chaptersRendered}
                    onRender={(pagesUsed, chapter) => updateCurrentPage(pagesUsed, chapter)}
                />
            )}

            {chaptersRendered.contents.rendered && (
                <SpecificationChapter
                    bidId={bidId}
                    models={models}
                    amounts={amounts}
                    startPage={chaptersRendered.contents.startPage}
                    name={'specification'}
                    chapterNum={1}
                    currency={currency}
                    onRender={(pagesUsed, chapter) => updateCurrentPage(pagesUsed, chapter)}
                />
            )}

            {chaptersRendered.specification.rendered && (
                <CharacteristicsChapter
                    startPage={chaptersRendered.specification.startPage}
                    name={'characteristics'}
                    subChapterNum={1.1}
                    characteristicInfo={info.characteristicInfo}
                    onRender={(pagesUsed, chapter) => updateCurrentPage(pagesUsed, chapter)}
                />
            )}
        </div>
    );
}

export default Print;

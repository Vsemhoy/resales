import {useState, useEffect} from "react";
import TitleChapter from "./chapters/TitleChapter";
import ContentsChapter from "./chapters/ContentsChapter";
import SpecificationChapter from "./chapters/SpecificationChapter";
import CharacteristicsChapter from "./chapters/CharacteristicsChapter";

const Print = ({ bidId, type, info, phone, email, currency }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const [chaptersRendered, setChaptersRendered] = useState({
        title: {
            startPage: 1,
            rendered: false
        },
        contents: {
            startPage: 0,
            rendered: false
        },
        specification: {
            startPage: 0,
            rendered: false
        },
        characteristics: {
            startPage: 0,
            rendered: false
        },
    });

    const updateCurrentPage = (newPage, chapter) => {
        setChaptersRendered(prev => {
            return {
                ...prev,
                [chapter]: {
                    startPage: currentPage,
                    rendered: true
                }
            }
        });
        setCurrentPage(newPage);
        console.log(chaptersRendered)
    };

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
                    startPage={currentPage}
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
                    startPage={currentPage}
                    name={'specification'}
                    chapterNum={1}
                    currency={currency}
                    onRender={(pagesUsed, chapter) => updateCurrentPage(pagesUsed, chapter)}
                />
            )}

            {chaptersRendered.specification.rendered && (
                <CharacteristicsChapter
                    startPage={currentPage}
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

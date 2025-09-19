import {useState, useEffect} from "react";
import TitleChapter from "./chapters/TitleChapter";
import ContentsChapter from "./chapters/ContentsChapter";
import SpecificationChapter from "./chapters/SpecificationChapter";
import CharacteristicsChapter from "./chapters/CharacteristicsChapter";

const Print = ({ bidId, type, info, models, phone, email, currency, amounts }) => {
    //const [currentPage, setCurrentPage] = useState(1);
    const [titleChapter, setTitleChapter] = useState(false);
    const [contentsChapter, setContentsChapter] = useState(false);
    const [specificationChapter, setSpecificationChapter] = useState(false);
    const [characteristicsChapter, setCharacteristicsChapter] = useState(false);

    const [titleChapterStart, setTitleChapterStart] = useState(1);
    const [contentsChapterStart, setContentsChapterStart] = useState(0);
    const [specificationChapterStart, setSpecificationChapterStart] = useState(0);
    const [characteristicsChapterStart, setCharacteristicsChapterStart] = useState(0);

    return (
        <div className="print-container">
            <TitleChapter
                type={type}
                titleInfo={info.titleInfo}
                startPage={titleChapterStart}
                name={'title'}
                phone={phone}
                email={email}
                onRender={() => {
                    setContentsChapterStart(2);
                    setSpecificationChapterStart(3);
                    setTitleChapter(true);
                    setTitleChapterStart(1);
                }}
            />

            {characteristicsChapter && (
                <ContentsChapter
                    startPage={contentsChapterStart}
                    name={'contents'}
                    chapterNum={1}
                    subChapterNum={1.1}
                    chaptersRendered={{
                        title: {
                            startPage: titleChapterStart,
                            rendered: titleChapter
                        },
                        contents: {
                            startPage: contentsChapterStart,
                            rendered: contentsChapter
                        },
                        specification: {
                            startPage: specificationChapterStart,
                            rendered: specificationChapter
                        },
                        characteristics: {
                            startPage: characteristicsChapterStart,
                            rendered: characteristicsChapter
                        },
                    }}
                    onRender={(pagesUsed) => {
                        setSpecificationChapterStart(pagesUsed);
                        setContentsChapter(true);
                    }}
                />
            )}

            {titleChapter && (
                <SpecificationChapter
                    bidId={bidId}
                    models={models}
                    amounts={amounts}
                    startPage={specificationChapterStart}
                    name={'specification'}
                    chapterNum={1}
                    currency={currency}
                    onRender={(pagesUsed, chapter) => {
                        setCharacteristicsChapterStart(pagesUsed);
                        setSpecificationChapter(true);
                    }}
                />
            )}

            {specificationChapter && (
                <CharacteristicsChapter
                    startPage={characteristicsChapterStart}
                    name={'characteristics'}
                    subChapterNum={1.1}
                    characteristicInfo={info.characteristicInfo}
                    onRender={(pagesUsed) => {
                        setCharacteristicsChapter(true);
                    }}
                />
            )}
        </div>
    );
}

export default Print;

const PageFooter = ({ pageNumSelf }) => {
    return (
        <div>
            {pageNumSelf % 2 === 0 ? (
                <div className="footer-1">
                    <div className="footer-block">
                        <p className="page-number">{pageNumSelf < 10 ? '0' + pageNumSelf : pageNumSelf}</p>
                        <p className="site">www.arstel.com</p>
                    </div>
                    <img className="footer-img" src="/media/ARSTEL_small.png" alt="arstel_logo" />
                </div>
            ) : (
                <div className="footer-2">
                    <img className="footer-img" src="/media/INTER-M_small.png" alt="inter-m_logo" />
                    <div className="footer-block">
                        <p className="site">www.arstel.com</p>
                        <p className="page-number">{pageNumSelf < 10 ? '0' + pageNumSelf : pageNumSelf}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PageFooter;

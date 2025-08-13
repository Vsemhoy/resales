export const getOrgTabName = (t) => {
    var targetTab = '';
    
      switch (t) {
        case 'b':
          targetTab = 'счета';
          break;
        case 'o':
          targetTab = 'кп';
          break;
      
        case 'c':
          targetTab = 'встречи/звонки';
          break;

        case 'n':
          targetTab = 'заметки';
          break;

        case 'h':
          targetTab = 'история';
          break;

        case 'p':
          targetTab = 'проекты';
          break;

        default:
          break;
      }
    return targetTab;
}


export const getOrgTabLink = (t) => {
    var targetTab = '';
    
      switch (t) {
        case 'b':
          targetTab = '/bills';
          break;
        case 'o':
          targetTab = '/offers';
          break;
      
        case 'c':
          targetTab = '/meetings';
          break;

        case 'n':
          targetTab = '/notes';
          break;

        case 'h':
          targetTab = '/history';
          break;

        case 'p':
          targetTab = '/projects';
          break;

        default:
          break;
      }
    return targetTab;
}
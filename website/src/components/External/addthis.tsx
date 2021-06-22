import { useScript } from "../../hooks/useScript";

export const AddThisScript = () => {
    useScript('//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-60a793659d5a70ad', true);
    return(<></>);
}
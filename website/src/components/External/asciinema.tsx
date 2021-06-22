import { useExternalStyles } from "../../hooks/useExternalStyles";
import { useScript } from "../../hooks/useScript";

export const AsciinemaScriptsAndLinks = () => {
    useExternalStyles('css/asciinema-player.css');
    useExternalStyles('css/custom-asciinema-player.css');
    useScript('js/asciinema-player.js', false);
    return(<></>);
}
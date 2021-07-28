export const doesImageExist = (src: string) => {
    var http = new XMLHttpRequest();
    http.open('HEAD', src, false);
    http.send();
    return http.status !== 404;
}
export const isImageExist = (src: string) => {
    const img = new Image();
    img.src = src;
    return img.width
}
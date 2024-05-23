const durationCalculator = (songLength:number) => {
    const minutes = Math.floor(songLength / 60);
    const seconds = songLength - minutes * 60;

    return(`${minutes}:${seconds<10 ? '0'+seconds : seconds}`);
}

export default durationCalculator
export function isCommand(text) {
    const firstWord = text.split(' ')[0];
    return firstWord.includes('bull') || firstWord.includes('byq')
}

export function isCorrectCommand(text) {
    return text.split(' ').length === 3
}

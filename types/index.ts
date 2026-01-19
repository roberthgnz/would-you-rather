export type WYRCategory = 'divertido' | 'romantico' | 'aventura' | 'comida' | 'random';

export interface WYRQuestion {
    id: number;
    optionA: string;
    optionB: string;
    category: WYRCategory;
}

export type WYRAnswer = 'A' | 'B' | null;

export interface WYRRoundResult {
    questionId: number;
    hostAnswer: WYRAnswer;
    guestAnswer: WYRAnswer;
    match: boolean;
}

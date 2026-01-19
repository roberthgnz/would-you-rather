export type GameCategory = 'divertido' | 'romantico' | 'aventura' | 'comida' | 'random';

export interface Question {
    id: number;
    optionA: string;
    optionB: string;
    category: GameCategory;
}

export type Answer = 'A' | 'B' | null;

export interface RoundResult {
    questionId: number;
    hostAnswer: Answer;
    guestAnswer: Answer;
    match: boolean;
}

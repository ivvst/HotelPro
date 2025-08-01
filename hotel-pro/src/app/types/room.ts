export interface Room {
    _id: string,
    number: string;
    deck: string,
    guests: number;
    class: 'yellow' | 'red' | '' | string;
    isVip: boolean;
    cruiseId: string;
}
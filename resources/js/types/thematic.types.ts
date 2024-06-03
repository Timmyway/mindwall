interface User {
    id: number;
    name: string;
    email: string;
}

export interface Thematic {
    id: number;
    name: string;
    user: User;
    quotes: Quote[]
}

export interface QuotePositionObject {
  x: number,
  y: number
}

export interface Quote {
    id: number;
    name: string;
    position: string | QuotePositionObject;
}

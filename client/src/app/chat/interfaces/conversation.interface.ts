export interface Conversation extends ConversationCreation {
    _id: string;
}

export interface ConversationCreation {
    name: string;
}

export interface JoinConversationUI extends Conversation {
    joined: boolean;
}

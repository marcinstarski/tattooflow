-- Add field to mark conversations as handled without sending a message
ALTER TABLE "Client" ADD COLUMN "lastConversationHandledAt" TIMESTAMP(3);

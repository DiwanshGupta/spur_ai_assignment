import type { Request, Response } from "express";
import { pool } from "../db/db.js";
import { generateReply } from "../services/openai.service.js";
import { v4 as uuid } from "uuid";

export const sendMessage = async (
  req: Request,
  res: Response
) => {
  const { message, sessionId } = req.body;

  let conversationId = sessionId;

  if (!conversationId) {
    conversationId = uuid();

    await pool.query(
      `
      INSERT INTO conversations(id)
      VALUES($1)
    `,
      [conversationId]
    );
  }

  await pool.query(
    `
    INSERT INTO messages
    (id, conversation_id, role, content)
    VALUES($1,$2,$3,$4)
  `,
    [uuid(), conversationId, "user", message]
  );

  const historyResult = await pool.query(
    `
    SELECT role, content
    FROM messages
    WHERE conversation_id=$1
    ORDER BY created_at ASC
    LIMIT 10
  `,
    [conversationId]
  );
  const reply = await generateReply(
    historyResult.rows,
    message
  );

  await pool.query(
    `
    INSERT INTO messages
    (id, conversation_id, role, content)
    VALUES($1,$2,$3,$4)
  `,
    [uuid(), conversationId, "assistant", reply]
  );

  res.json({
    reply,
    sessionId: conversationId,
  });
};

export const getMessages = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  const result = await pool.query(
    `SELECT role, content FROM messages WHERE conversation_id=$1 ORDER BY created_at ASC`,
    [sessionId]
  );

  res.json({ messages: result.rows });
};
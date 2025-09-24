import { lucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { hash } from "@node-rs/argon2";
import { generateId } from "lucia";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    throw redirect(302, "/");
  }
  return {};
};

export const actions: Actions = {
  default: async (event) => {
    const formData = await event.request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (
      typeof email !== "string" ||
      email.length < 3 ||
      email.length > 31 ||
      !/\S+@\S+\.\S+/.test(email)
    ) {
      return fail(400, {
        error: "Invalid email address",
        email
      });
    }
    if (typeof password !== "string" || password.length < 6 || password.length > 255) {
      return fail(400, {
        error: "Password must be between 6 and 255 characters",
        email
      });
    }
    if (password !== confirmPassword) {
      return fail(400, {
        error: "Passwords do not match",
        email
      });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return fail(400, {
        error: "An account with this email already exists",
        email
      });
    }

    const userId = generateId(15);
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    });

    try {
      await createUser(userId, email, passwordHash);
      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return fail(500, {
        error: "An error occurred while creating your account",
        email
      });
    }

    throw redirect(302, "/");
  }
};

import { pool } from "$lib/server/auth";

async function getUserByEmail(email: string) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM user WHERE email = ?',
      [email]
    );
    const users = rows as any[];
    return users.length > 0 ? users[0] : null;
  } finally {
    connection.release();
  }
}

async function createUser(userId: string, email: string, hashedPassword: string) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      'INSERT INTO user (id, email, hashed_password) VALUES (?, ?, ?)',
      [userId, email, hashedPassword]
    );
  } finally {
    connection.release();
  }
}
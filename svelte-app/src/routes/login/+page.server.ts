import { lucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { verify } from "@node-rs/argon2";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    throw redirect(302, "/dashboard");
  }
  return {};
};

export const actions: Actions = {
  default: async (event) => {
    const formData = await event.request.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    if (
      typeof email !== "string" ||
      email.length < 3 ||
      email.length > 31 ||
      !/\S+@\S+\.\S+/.test(email)
    ) {
      return fail(400, {
        error: "Invalid email",
        email
      });
    }
    if (typeof password !== "string" || password.length < 6 || password.length > 255) {
      return fail(400, {
        error: "Invalid password"
      });
    }

    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      return fail(400, {
        error: "Incorrect email or password"
      });
    }

    const validPassword = await verify(existingUser.hashed_password, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    });
    if (!validPassword) {
      return fail(400, {
        error: "Incorrect email or password"
      });
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });

    throw redirect(302, "/dashboard");
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
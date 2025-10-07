import { lucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { verify, hash } from "@node-rs/argon2";
import type { Actions, PageServerLoad } from "./$types";
import { getPool } from "$lib/server/db";

const pool = getPool();

export const load: PageServerLoad = async (event) => {
  if (!event.locals.user) {
    throw redirect(302, "/login");
  }

  // Get user data including subscription tier
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT email, subscription_tier FROM user WHERE id = ?',
      [event.locals.user.id]
    );
    const users = rows as any[];
    return {
      user: users[0]
    };
  } finally {
    connection.release();
  }
};

export const actions: Actions = {
  updateProfile: async (event) => {
    if (!event.locals.user) {
      return fail(401, { error: "Unauthorized" });
    }

    const formData = await event.request.formData();
    const newEmail = formData.get("email");
    const newPassword = formData.get("newPassword");

    if (
      typeof newEmail !== "string" ||
      newEmail.length < 3 ||
      newEmail.length > 255 ||
      !/\S+@\S+\.\S+/.test(newEmail)
    ) {
      return fail(400, {
        error: "Invalid email address",
        email: newEmail
      });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check if email is already taken
      const [existingRows] = await connection.execute(
        'SELECT id FROM user WHERE email = ? AND id != ?',
        [newEmail, event.locals.user.id]
      );
      const existing = existingRows as any[];

      if (existing.length > 0) {
        await connection.rollback();
        return fail(400, {
          error: "Email already in use",
          email: newEmail
        });
      }

      // Update email
      await connection.execute(
        'UPDATE user SET email = ? WHERE id = ?',
        [newEmail, event.locals.user.id]
      );

      // Update password if provided
      if (newPassword && typeof newPassword === "string" && newPassword.length > 0) {
        if (newPassword.length < 6 || newPassword.length > 255) {
          await connection.rollback();
          return fail(400, {
            error: "Password must be at least 6 characters",
            email: newEmail
          });
        }

        const hashedPassword = await hash(newPassword, {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1
        });

        await connection.execute(
          'UPDATE user SET hashed_password = ? WHERE id = ?',
          [hashedPassword, event.locals.user.id]
        );
      }

      await connection.commit();

      return { success: true, email: newEmail };

    } catch (err) {
      await connection.rollback();
      console.error('Error updating profile:', err);
      return fail(500, {
        error: "Failed to update profile. Please try again.",
        email: newEmail
      });
    } finally {
      connection.release();
    }
  },

  updatePassword_old: async (event) => {
    if (!event.locals.user) {
      return fail(401, { error: "Unauthorized" });
    }

    const formData = await event.request.formData();
    const newPassword = formData.get("newPassword");

    if (typeof newPassword !== "string" || newPassword.length < 6 || newPassword.length > 255) {
      return fail(400, {
        passwordError: "Password must be at least 6 characters"
      });
    }

    const connection = await pool.getConnection();
    try {
      // Hash new password
      const hashedPassword = await hash(newPassword, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
      });

      // Update password
      await connection.execute(
        'UPDATE user SET hashed_password = ? WHERE id = ?',
        [hashedPassword, event.locals.user.id]
      );

      return { passwordSuccess: true };
    } finally {
      connection.release();
    }
  }
};

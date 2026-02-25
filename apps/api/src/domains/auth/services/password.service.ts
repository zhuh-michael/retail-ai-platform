import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class PasswordService {
  /**
   * 哈希密码
   */
  async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    // 生成盐
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    
    // 哈希密码
    const hash = await bcrypt.hash(password, salt);
    
    return { hash, salt };
  }

  /**
   * 验证密码
   */
  async verifyPassword(
    password: string,
    hash: string,
    salt?: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * 验证密码强度
   */
  validatePasswordStrength(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('密码至少 8 个字符');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('密码必须包含大写字母');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('密码必须包含小写字母');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('密码必须包含数字');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

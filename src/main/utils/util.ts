import * as crypto from 'crypto';
import * as fs from 'fs-extra';

export function checksumFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path)
      .on('error', reject)
      .pipe(crypto.createHash('sha256').setEncoding('hex'))
      .once('finish', function (this: crypto.Hash) {
        resolve(this.read() as string);
      });
  });
}

import { uploadFile, deleteFile, getFileUrl } from '../../utils/supabase';

describe('Supabase Utils', () => {
  describe('uploadFile', () => {
    it('should return a function', () => {
      expect(typeof uploadFile).toBe('function');
    });

    // Note: Actual file upload tests would require Supabase configuration
    // and should be run in integration tests
  });

  describe('deleteFile', () => {
    it('should return a function', () => {
      expect(typeof deleteFile).toBe('function');
    });
  });

  describe('getFileUrl', () => {
    it('should generate a public URL for a file path', () => {
      const filePath = 'test/file.pdf';
      const url = getFileUrl(filePath);
      
      expect(url).toBeTruthy();
      expect(typeof url).toBe('string');
      expect(url).toContain(filePath);
    });
  });
});


// Mock das integrações para substituir o base44 SDK
// Esta implementação permite que o código continue funcionando sem o base44

const mockIntegration = {
  InvokeLLM: () => Promise.resolve({ data: 'Mock LLM response' }),
  SendEmail: () => Promise.resolve({ success: true }),
  SendSMS: () => Promise.resolve({ success: true }),
  UploadFile: () => Promise.resolve({ url: 'mock-url' }),
  GenerateImage: () => Promise.resolve({ url: 'mock-image-url' }),
  ExtractDataFromUploadedFile: () => Promise.resolve({ data: {} })
};

export const Core = mockIntegration;
export const InvokeLLM = mockIntegration.InvokeLLM;
export const SendEmail = mockIntegration.SendEmail;
export const SendSMS = mockIntegration.SendSMS;
export const UploadFile = mockIntegration.UploadFile;
export const GenerateImage = mockIntegration.GenerateImage;
export const ExtractDataFromUploadedFile = mockIntegration.ExtractDataFromUploadedFile;

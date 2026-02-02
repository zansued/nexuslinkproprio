// Mock client para substituir o base44 SDK
// Esta é uma implementação mock para manter a compatibilidade com o código existente

export const base44 = {
  integrations: {
    Core: {
      InvokeLLM: () => Promise.resolve({ data: 'Mock LLM response' }),
      SendEmail: () => Promise.resolve({ success: true }),
      SendSMS: () => Promise.resolve({ success: true }),
      UploadFile: () => Promise.resolve({ url: 'mock-url' }),
      GenerateImage: () => Promise.resolve({ url: 'mock-image-url' }),
      ExtractDataFromUploadedFile: () => Promise.resolve({ data: {} })
    }
  }
};

// Funções mock para integrações específicas
export const Core = base44.integrations.Core;
export const InvokeLLM = Core.InvokeLLM;
export const SendEmail = Core.SendEmail;
export const SendSMS = Core.SendSMS;
export const UploadFile = Core.UploadFile;
export const GenerateImage = Core.GenerateImage;
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;

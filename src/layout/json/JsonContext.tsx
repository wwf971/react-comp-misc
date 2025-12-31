import React, { createContext, useContext, useMemo } from 'react';

export type TypeConversionBehavior = 'allow' | 'reject';

export interface ConversionMenuRequest {
  position: { x: number; y: number };
  currentValue: any;
  currentType: string;
  path: string;
  availableConversions: {
    targetType: string;
    canConvert: boolean;
  }[];
}

interface JsonContextValue {
  typeConversionBehavior: TypeConversionBehavior;
  showConversionMenu?: (request: ConversionMenuRequest) => void;
}

const JsonContext = createContext<JsonContextValue>({
  typeConversionBehavior: 'allow'
});

export const useJsonContext = () => useContext(JsonContext);

export const JsonContextProvider: React.FC<{
  children: React.ReactNode;
  typeConversionBehavior?: TypeConversionBehavior;
  showConversionMenu?: (request: ConversionMenuRequest) => void;
}> = ({ children, typeConversionBehavior = 'allow', showConversionMenu }) => {
  const contextValue = useMemo(
    () => ({ typeConversionBehavior, showConversionMenu }),
    [typeConversionBehavior, showConversionMenu]
  );

  return (
    <JsonContext.Provider value={contextValue}>
      {children}
    </JsonContext.Provider>
  );
};


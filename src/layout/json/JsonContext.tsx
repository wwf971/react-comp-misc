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
  queryParentInfo?: (path: string) => { 
    isSingleEntryInParent: boolean; 
    itemKey?: string;
    isFirstInParent?: boolean;
    isLastInParent?: boolean;
  };
}

const JsonContext = createContext<JsonContextValue>({
  typeConversionBehavior: 'allow'
});

export const useJsonContext = () => useContext(JsonContext);

export const JsonContextProvider: React.FC<{
  children: React.ReactNode;
  typeConversionBehavior?: TypeConversionBehavior;
  showConversionMenu?: (request: ConversionMenuRequest) => void;
  rootData?: any;
}> = ({ children, typeConversionBehavior = 'allow', showConversionMenu, rootData }) => {
  // Query function to check if a path is the only entry/item in its parent
  const queryParentInfo = useMemo(() => {
    if (!rootData) return undefined;
    
    return (path: string) => {
      try {
        // Parse path to navigate to parent
        const pathParts = path.split('.').flatMap(part => 
          part.startsWith('.') ? [part.slice(1)] : [part]
        ).filter(part => part !== '');
        
        if (pathParts.length === 0) {
          return { isSingleEntryInParent: false };
        }
        
        // Navigate to parent
        let parent = rootData;
        for (let i = 0; i < pathParts.length - 1; i++) {
          parent = parent[pathParts[i]];
          if (!parent) return { isSingleEntryInParent: false };
        }
        
        const currentKey = pathParts[pathParts.length - 1];
        
        // Check if parent is dict or array and has only one entry/item
        if (Array.isArray(parent)) {
          // Get indices of real items (non-pseudo)
          const realItemIndices: number[] = [];
          parent.forEach((item, idx) => {
            if (!(item && typeof item === 'object' && 'isPseudo' in item && (item as any).isPseudo)) {
              realItemIndices.push(idx);
            }
          });
          
          const currentIndex = parseInt(currentKey, 10);
          const positionInReal = realItemIndices.indexOf(currentIndex);
          const isFirst = positionInReal === 0;
          const isLast = positionInReal === realItemIndices.length - 1;
          
          return { 
            isSingleEntryInParent: realItemIndices.length === 1,
            isFirstInParent: isFirst,
            isLastInParent: isLast
          };
        } else if (typeof parent === 'object' && parent !== null) {
          // Filter out pseudo keys
          const realKeys = Object.keys(parent).filter(k => !k.startsWith('__pseudo__'));
          const currentIndex = realKeys.indexOf(currentKey);
          const isFirst = currentIndex === 0;
          const isLast = currentIndex === realKeys.length - 1;
          
          return { 
            isSingleEntryInParent: realKeys.length === 1,
            itemKey: realKeys.length === 1 ? currentKey : undefined,
            isFirstInParent: isFirst,
            isLastInParent: isLast
          };
        }
        
        return { isSingleEntryInParent: false };
      } catch (e) {
        return { isSingleEntryInParent: false };
      }
    };
  }, [rootData]);
  
  const contextValue = useMemo(
    () => ({ typeConversionBehavior, showConversionMenu, queryParentInfo }),
    [typeConversionBehavior, showConversionMenu, queryParentInfo]
  );

  return (
    <JsonContext.Provider value={contextValue}>
      {children}
    </JsonContext.Provider>
  );
};


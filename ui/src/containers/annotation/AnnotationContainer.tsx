import React from 'react';
import { AnnotationContainer as AnnotationContainerComponent } from './annotation-container/AnnotationContainer';
import { AnnotationContainerProps } from './annotation-container/types/AnnotationContainer.types';

function AnnotationContainer(props: AnnotationContainerProps) {
  return <AnnotationContainerComponent {...props} />;
}

export default AnnotationContainer;

/* eslint-disable import/newline-after-import,import/first */
import '@testing-library/jest-dom';
import React from 'react';

// 将 React 设置为全局变量，这样就不需要在每个测试文件中导入它了
global.React = React;

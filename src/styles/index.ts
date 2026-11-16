import { createGlobalStyle } from 'antd-style';

import accessibility from './accessibility';
import antdOverride from './antdOverride';
import button from './components/button';
import collapse from './components/collapse';
import container from './components/container';
import extensions from './components/extensions';
import extensionsExtra from './components/extensionsExtra';
import forge from './components/forge';
import gallery from './components/gallery';
import input from './components/input';
import label from './components/label';
import lightboxModal from './components/lightboxModal';
import options from './components/options';
import popup from './components/popup';
import progress from './components/progress';
import sidebar from './components/sidebar';
import slider from './components/slider';
import surfaces from './components/surfaces';
import table from './components/table';
import tabs from './components/tabs';
import workspace from './components/workspace';
import mobile from './mobile';
import motion from './motion';
import tokens from './tokens';

const GlobalStyle = createGlobalStyle(({ theme }) => [
  tokens(theme),
  antdOverride(theme),
  button(theme),
  container(theme),
  gallery(theme),
  input(theme),
  label(),
  collapse(theme),
  options(theme),
  progress(theme),
  slider(theme),
  sidebar(theme),
  table(theme),
  tabs(theme),
  popup(theme),
  extensions(theme),
  extensionsExtra(theme),
  forge(theme),
  lightboxModal(theme),
  mobile(),
  motion,
  accessibility(theme),
  surfaces(theme),
  workspace(theme),
]);

export default GlobalStyle;

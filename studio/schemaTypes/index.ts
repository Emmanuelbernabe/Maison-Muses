import { link, cmsImage } from './objects';
import { coffret, member, article, episode, journalPost } from './documents';
import { homepage, siteSettings } from './singletons';
import { servicePage } from './servicePage';
import { brand } from './brand';

export const schemaTypes = [homepage, siteSettings, servicePage, brand, coffret, member, article, episode, journalPost, link, cmsImage];

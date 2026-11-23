import { link, cmsImage } from './objects';
import { coffret, member, article, episode, journalPost } from './documents';
import { homepage, siteSettings } from './singletons';
import { servicePage } from './servicePage';

export const schemaTypes = [homepage, siteSettings, servicePage, coffret, member, article, episode, journalPost, link, cmsImage];

import { link, cmsImage } from './objects';
import { coffret, journalPost } from './documents';
import { homepage, siteSettings, equipePage, journalPage } from './singletons';
import { servicePage } from './servicePage';
import { brand } from './brand';
import { legalPage } from './legal';

export const schemaTypes = [homepage, siteSettings, equipePage, journalPage, servicePage, brand, legalPage, coffret, journalPost, link, cmsImage];

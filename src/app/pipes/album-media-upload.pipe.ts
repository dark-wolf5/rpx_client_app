import {Pipe, PipeTransform} from '@angular/core';
import * as rpxGlobals from '../globals';

const RPX_TOP_DOMAIN = rpxGlobals.RESOURCES;

@Pipe({
  name: 'albumMediaPath',
})
export class AlbumMediaUploadPipe implements PipeTransform {
  transform(extra_media_path: string): string {
    return extra_media_path;
  }
}

import {Pipe, PipeTransform} from '@angular/core';
import * as rpxGlobals from '../globals';

const RPX_TOP_DOMAIN = rpxGlobals.API;

@Pipe({
  name: 'extraMediaPath',
})
export class ExtraMediaUploadPipe implements PipeTransform {
  transform(extra_media_path: string): string {
    if (!extra_media_path) {
      return;
    }
    // console.log("Extra Media Path from pipe : ", extra_media_path);
    const new_path = extra_media_path.split('../');
    extra_media_path = RPX_TOP_DOMAIN + new_path[1];
    // console.log("the Extra Media Path : ", extra_media_path);
    return extra_media_path;
  }
}

import { ModuleBase } from "../lib/module";

export class PlaylistModule extends ModuleBase {

  constructor(io, usersModule, playlistRepository, vidServices) {
    super();

    this._io = io;
    // for auth
    this._users = usersModule;

    // sabe playlist data to disc or db
    this._repository = playlistRepository;

    // locate videos
    this._services = vidServices;
  }
}

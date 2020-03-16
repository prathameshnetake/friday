"""Fauxmo plugin that runs a command on the local machine.

Runs a `shlex`ed command using `subprocess.run`, keeping the default of
`shell=False`. This is probaby frought with security concerns, which is why
this plugin is not included by default in `fauxmo.plugins`. By installing or
using it, you acknowledge that it could run commands from your config.json that
could lead to data compromise, corruption, loss, etc. Consider making your
config.json read-only. If there are parts of this you don't understand, you
should probably not use this plugin.

If the command runs with a return code of 0, Alexa should respond prompty
"Okay" or something that indicates it seems to have worked. If the command has
a return code of anything other than 0, Alexa stalls for several seconds and
subsequently reports that there was a problem (which should notify the user
that something didn't go as planned).

Note that `subprocess.run` as implemented in this plugin doesn't handle complex
commands with pipes, redirection, or multiple statements joined by `&&`, `||`,
`;`, etc., so you can't just use e.g. `"command that sometimes fails || true"`
to avoid the delay and Alexa's response. If you really want to handle more
complex commands, consider using this plugin as a template for another one
using `os.system` instead of `subprocess.run`, but realize that this comes with
substantial security risks that exceed my ability to explain.

Example config:
```
{
  "FAUXMO": {
    "ip_address": "auto"
  },
  "PLUGINS": {
    "CommandLinePlugin": {
      "path": "/path/to/commandlineplugin.py",
      "DEVICES": [
        {
            "name": "output stuff to a file",
            "port": 49915,
            "on_cmd": "touch testfile.txt",
            "off_cmd": "rm testfile.txt",
            "state_cmd": "ls testfile.txt"
        },
        {
            "name": "command with fake state",
            "port": 49916,
            "on_cmd": "touch testfile.txt",
            "off_cmd": "rm testfile.txt",
            "use_fake_state": true
        }
      ]
    }
  }
}
```
"""

import shlex
import subprocess
import requests

from fauxmo.plugins import FauxmoPlugin


class FridayAlexaPlugIn(FauxmoPlugin):
    """Fauxmo Plugin for running commands on the local machine."""

    def __init__(
        self,
        name: str,
        port: int,
        on_cmd: str,
        off_cmd: str,
        id: str,
        state_cmd: str = None,
        use_fake_state: bool = False
    ) -> None:
        """Initialize a CommandLinePlugin instance.

        Args:
            name: Name for this Fauxmo device
            port: Port on which to run a specific CommandLinePlugin instance
            on_cmd: Command to be called when turning device on
            off_cmd: Command to be called when turning device off
            state_cmd: Command to check device state (return code 0 == on)
            use_fake_state: If `True`, override `get_state` to return the
                            latest action as the device state. NB: The proper
                            json boolean value for Python's `True` is `true`,
                            not `True` or `"true"`.

        """
        self.on_cmd = on_cmd
        self.off_cmd = off_cmd
        self.state_cmd = state_cmd
        self.id = id
        self.use_fake_state = use_fake_state
        super().__init__(name=name, port=port)

    def run_cmd(self, cmd: str, operation: str) -> bool:
        """Partialmethod to run command.

        Args:
            cmd: Command to be run
        Returns:
            True if command seems to have run without error

        """
        print('{} is going to {}'.format(self.name, cmd))

        url = 'http://localhost:3000/control/{}'.format(operation)
        myobj = {'operation': cmd, 'id': self.id}

        x = requests.post(url, data = myobj)
        data = x.json()
        return data['msg'] == 'Success', data['status']

    def on(self) -> bool:
        """Run on command.

        Returns:
            True if command seems to have run without error.

        """
        return self.run_cmd(self.on_cmd, 'on')

    def off(self) -> bool:
        """Run off command.

        Returns:
            True if command seems to have run without error.

        """
        return self.run_cmd(self.off_cmd,  'off')

    def get_state(self) -> str:
        """Get device state.

        NB: Return code of `0` (i.e. ran without error) indicates "on" state,
        otherwise will be off. making it easier to have something like `ls
        path/to/pidfile` suggest `on`. Many command line switches may not
        actually have a "state" per se (just an arbitary command you want to
        run), in which case you could just put "false" as the command, which
        should always return "off".

        Returns:
            "on" osubprocessr "off" if `state_cmd` is defined, "unknown" if undefined

        """
        if self.use_fake_state is True:
            return super().get_state()

        returned_zero, status = self.run_cmd(self.state_cmd, 'status')
        print(status)
        return status
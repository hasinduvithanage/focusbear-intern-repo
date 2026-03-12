How does Docker differ from a virtual machine?

A VM virtualizes the entire hardware, the VM will run its own seperate operating system and has its own reserve CPU/RAM. Whereas Docker shares the host OS and only packages the application code and the environment, such as dependencies. 


Why is containerization useful for a backend like Focus Bear’s?

This concept is useful because this allows every developer on the team to run the same container therefore there won't be any environment differences between the laptops of developers and production servers.
This also makes it extremely fast for new developers to setup since they can just run one command and get the same environment.

How do containers help with dependency management?

Since different projects has different dependencies, like specific versions of python and node, containers solve this because each container has ots own exact dependencies inside of them and it is isolated from the host machine. So different containers can run different dependencies. Containers also help to keep dependencies consistent across all developers since if all developers are using the same container, they are basically all in the same environment.

What are the potential downsides of using Docker?

There is a learning curve to docker, so errors will be confusing to a beginner.
When there are many containers, managing them would be difficult.
Debugging is trickier since if something breaks inside the container, we need to know how to get inside the container and read its logs.




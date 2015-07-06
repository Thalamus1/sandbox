using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(CalendarTest.Startup))]
namespace CalendarTest
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}

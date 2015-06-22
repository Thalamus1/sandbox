using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TtfConverterNet
{
    class Program
    {
        static void Main(string[] args)
        {
            bool help = false;

            if(args.Length == 0 || args.Length > 1)
            {
                help = true;
            }

            if(help)
            {
                Console.WriteLine("HELP: TtfConverterNet.exe <ttfOriginFile>");
                Console.WriteLine("Press any key to exit...");
                Console.ReadKey();
                return;
            }

            string ttfOriginFile = args[0];

            if(!File.Exists(ttfOriginFile))
            {
                Console.WriteLine("TTF origin file does not exist");
                Console.WriteLine("Press any key to exit...");
                Console.ReadKey();
                return;
            }

            uint fstype = 0;
            uint sum = 0;
            int length = 0;
            long loc = 0;

            using(var fs = new FileStream(ttfOriginFile, FileMode.Open, FileAccess.ReadWrite))
            {
                long fsLength = fs.Length;
                var br = new BinaryReader(fs);
                var bw = new BinaryWriter(fs);
                byte[] type = new byte[4];

                fs.Seek(12, 0);
                while(fs.Position < fsLength)
                {
                    for(int x = 0; x < 4; x++)
                    {
                        type[x] = br.ReadByte();
                        if(fs.Position == fsLength)
                        {
                            fatal();
                            return;
                        }
                    }
                    string s = Encoding.UTF8.GetString(type);
                    if(s.ToUpper() == "OS/2")
                    {
                        loc = fs.Position;
                        for(int x = 4; x > 0; x--)
                        {
                            br.ReadByte();
                            if(fs.Position == fsLength)
                            {
                                fatal();
                                return;
                            }
                        }

                        fstype = (uint)br.ReadByte() << 24;
                        fstype |= (uint)br.ReadByte() << 16;
                        fstype |= (uint)br.ReadByte() << 8;
                        fstype |= (uint)br.ReadByte();

                        length = (int)br.ReadByte() << 24;
                        length |= (int)br.ReadByte() << 16;
                        length |= (int)br.ReadByte() << 8;
                        length |= (int)br.ReadByte();

                        if((fstype + 8) > fsLength)
                        {
                            fatal();
                            return;
                        }

                        fs.Seek(fstype + 8, 0);
                        bw.Write((byte)0);
                        bw.Write((byte)0);

                        fs.Seek(fstype, 0);
                        for(int x = length; x > 0; x--)
                        {
                            sum += (uint)br.ReadByte();
                        }

                        fs.Seek(loc, 0);
                        bw.Write((byte)(sum >> 24));
                        bw.Write((byte)(255 & (sum >> 16)));
                        bw.Write((byte)(255 & (sum >> 8)));
                        bw.Write((byte)(255 & sum));

                        break;
                    }
                }
                br.Dispose();
                bw.Dispose();
            }

            Console.WriteLine("TTf file '{0}' has been converted", ttfOriginFile);
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }

        private static void fatal()
        {
            Console.WriteLine("Malformed TTF file");
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }
    }
}

export default function Settings() {
  return (
    <div className='bg-slate-100 h-full w-full p-10 flex'>
      <div className='bg-slate-50 w-full h-full mx-5 rounded-lg shadow-sm border-slate-200 border-2 flex flex-col'>
        <h2 className='text-2xl font-medium py-6 border-b w-full px-10'>Document upload</h2>
        <div className='py-6 px-10 w-full'>
          <input
            type='file'
            className='hidden'
            accept='application/pdf'
          />
        </div>
      </div>
    </div>
  );
}
